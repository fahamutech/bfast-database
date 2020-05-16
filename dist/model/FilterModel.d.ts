declare type BasicFilterModel<T> = {
    $and?: Array<FilterModel<T>>;
    $nor?: Array<FilterModel<T>>;
    $or?: Array<FilterModel<T>>;
    $text?: {
        $search: string;
        $language?: string;
        $caseSensitive?: boolean;
        $diacraticSensitive?: boolean;
    };
    $where?: string | Function;
    $comment?: string;
};
declare type FilterSelector<T> = {
    $eq?: T;
    $gt?: T;
    $gte?: T;
    $in?: T[];
    $lt?: T;
    $lte?: T;
    $ne?: T;
    $nin?: T[];
    $not?: T extends string ? (FilterSelector<T> | RegExp) : FilterSelector<T>;
    $exists?: boolean;
    $expr?: any;
    $jsonSchema?: any;
    $mod?: T extends number ? [number, number] : never;
    $regex?: T extends string ? (RegExp | string) : never;
    $options?: T extends string ? string : never;
    $geoIntersects?: {
        $geometry: object;
    };
    $geoWithin?: object;
    $near?: object;
    $nearSphere?: object;
    $maxDistance?: number;
    $all?: T extends Array<infer U> ? any[] : never;
    $elemMatch?: T extends Array<infer U> ? object : never;
    $size?: T extends Array<infer U> ? number : never;
};
declare type FilterCondition<T> = FilterAltQuery<T> | FilterSelector<FilterAltQuery<T>>;
declare type FilterAltQuery<T> = T extends Array<infer U> ? (T | FilterRegExpForString<U>) : FilterRegExpForString<T>;
declare type FilterRegExpForString<T> = T extends string ? (RegExp | T) : T;
export declare type FilterModel<T> = {
    [P in keyof T]?: FilterCondition<T[P]>;
} & BasicFilterModel<T>;
export {};
