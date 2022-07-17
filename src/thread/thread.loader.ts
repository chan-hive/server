import * as DataLoader from "dataloader";

import { ThreadService } from "@thread/thread.service";

export function createFileCountLoader(threadService: ThreadService) {
    return new DataLoader<number, number>(async keys => threadService.getFileCountByIds(keys));
}
