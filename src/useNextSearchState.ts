import { UrlObject } from "url";
import { isNil, isUndefined, merge, omitBy } from "lodash";
import { NextRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { parse, ParsedUrlQuery } from "querystring";

import { Serializer, Deserializer, StateUpdateOptions } from "./types";

export const useNextSearchState = <T extends {}>(
  router: NextRouter,
  serialize: Serializer<T>,
  deserialize: Deserializer<T>,
  initialState?: T
): [
  Partial<T>,
  (incomingState: Partial<T>, options?: StateUpdateOptions) => void
] => {
  const state = useMemo(() => {
    const state = initialState
      ? {
          ...initialState,
          ...deserialize(router.query),
        }
      : deserialize(router.query);

    return omitBy<Partial<T>>(state, (value) => isUndefined(value));
  }, [deserialize, router.query]);

  const setState = useCallback(
    (
      incomingState: Partial<T> | ((s: Partial<T>) => Partial<T>),
      options: StateUpdateOptions = {}
    ) => {
      const nextState = merge(
        state,
        typeof incomingState === "function"
          ? incomingState(state)
          : incomingState
      );

      const query = omitBy<ParsedUrlQuery>(
        merge(router.query, serialize(nextState)),
        (value) => isUndefined(value)
      );

      const { to, as, replace, ...routerPushOptions } = options;

      let url: UrlObject = {
        query,
        pathname: router.pathname,
      };

      if (typeof to === "string") {
        url.pathname = to;
      } else if (typeof to === "object") {
        let { query: toQuery, ...toRest } = to;

        if (typeof toQuery === "string") {
          toQuery = parse(toQuery);
        } else if (isNil(toQuery)) {
          toQuery = {};
        }

        const mergedQuery = merge(toQuery, query);

        url = merge(url, toRest, {
          query: mergedQuery,
        });
      }

      if (replace) {
        router.replace(url, as, routerPushOptions);
      } else {
        router.push(url, as, routerPushOptions);
      }
    },
    [serialize, state]
  );

  return [state, setState];
};
