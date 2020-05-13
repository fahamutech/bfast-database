import {ObjectId} from "mongodb";

export interface BasicAttributesModel {
    id?: string;
    _id?: string | ObjectId;
    createdAt?: Date;
    _created_at?: Date;
    updatedAt?: Date;
    _updated_at?: Date;
    createdBy?: string;
    _created_by?: string;
    return?: string[]
}
