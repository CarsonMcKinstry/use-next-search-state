import { UrlObject } from "url";
import { ParsedUrlQuery } from "querystring";

type Url = UrlObject | string;

export type Serializer<T extends {}> = (state: Partial<T>) => ParsedUrlQuery;

export type Deserializer<T extends {}> = (query: ParsedUrlQuery) => Partial<T>;

export interface StateUpdateOptions {
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
  replace?: boolean;
  to?: Url;
  as?: Url;
}
