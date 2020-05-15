import {FilterModel} from "./FilterModel";

export interface UpdateModel<T> {
    id: string;
    upsert: boolean;
    filter: FilterModel<T>;
    update: { [K in keyof T]: any };
    return: string[];
}
