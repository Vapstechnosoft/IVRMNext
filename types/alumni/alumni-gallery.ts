export interface IAlumniGallery {
    algA_Id: number;
    algA_GalleryName: string;
    algA_Date: string | Date;
    algA_Time: string;
    algA_CommonGalleryFlg: string;
    algA_ActiveFlag: boolean;
    images_list?: IAlumniGalleryFile[];
    view_galleryimg?: IAlumniGalleryView[];
}

export interface IAlumniGalleryFile {
    filePath: string;
    fileName: string;
}

export interface IAlumniGalleryView {
    algaP_Id?: number;
    algaP_Photos?: string;
    algaV_Id?: number;
    algaV_Videos?: string;
}
