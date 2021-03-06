import * as mongoose from 'mongoose';
import { cmsUser } from '../user/user.model';
import { IBaseDocument, IBaseModel, BaseSchema } from '../shared/base.model';

export type RefContent = {
    refPath: string;
    content: any;
}

export interface IHierarchyContent {
    parentId: string;
    parentPath: string;
    ancestors: string[];
    hasChildren: boolean;
}

export interface ISoftDeletedContent {
    isDeleted: boolean;
}

export interface IPublishableContent {
    publishedAt: Date;
    publishedBy: any;

    isPublished: boolean;
}

export interface IContentHasChildItems {
    childItems: RefContent[];
    publishedChildItems: RefContent[];
}

export interface IFolder extends ISoftDeletedContent, IHierarchyContent {
    name: string;
}

export interface IContent extends IContentHasChildItems, IPublishableContent, ISoftDeletedContent, IHierarchyContent {
    name: string;

    contentType: string;
    properties: any;

    //not map to db
    isDirty: boolean;
}

export interface IContentVersion extends IContent {
    contentId: any;
}

export interface IPublishedContent extends IContentVersion {
    contentVersionId: any;
}

export interface IFolderDocument extends IFolder, IBaseDocument { }

export interface IContentDocument extends IContent, IBaseDocument { }

export interface IContentVersionDocument extends IContentVersion, IBaseDocument { }

export interface IPublishedContentDocument extends IPublishedContent, IBaseDocument { }

export interface IContentModel<T extends IContentDocument> extends IBaseModel<T> { }

export interface IContentVersionModel<T extends IContentVersionDocument> extends IBaseModel<T> { }

export interface IPublishedContentModel<T extends IPublishedContentDocument> extends IBaseModel<T> { }

export const ContentSchema = new mongoose.Schema({
    ...BaseSchema.obj,

    publishedAt: Date,
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: cmsUser },

    name: { type: String, required: true },
    contentType: { type: String, required: false },

    parentId: { type: String, default: null },
    //https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-materialized-paths/
    parentPath: { type: String, required: false, index: true }, // ex ",parent1_id,parent2_id,parent3_id,"
    //https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-ancestors-array/
    ancestors: { type: [String], required: false }, // ex [parent1_id, parent2_id, parent3_id]
    hasChildren: { type: Boolean, required: true, default: false },

    isPublished: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },

    properties: mongoose.Schema.Types.Mixed
});

export const ContentHasChildItemsSchema = new mongoose.Schema({
    //contain all reference Ids of all current contents which be used in page such as block, media, page
    childItems: [{
        refPath: { type: String, required: true },
        content: { type: mongoose.Schema.Types.ObjectId, refPath: 'childItems.refPath' }
    }],
    //contain all reference Ids of all published contents which be used in page such as block, media, page
    publishedChildItems: [{
        refPath: { type: String, required: true },
        content: { type: mongoose.Schema.Types.ObjectId, refPath: 'publishedChildItems.refPath' }
    }]
})