import {FilterModel} from "./FilterModel";

export interface DeleteModel<T> {
    id: string;
    filter: FilterModel<T>;
    return: string[];
}
