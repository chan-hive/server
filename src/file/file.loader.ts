import * as DataLoader from "dataloader";

import { FileService } from "@file/file.service";

import { File } from "@file/models/file.model";

export function createFileLoader(fileService: FileService) {
    return new DataLoader<number, File>(async keys => fileService.getFileByIds(keys));
}
