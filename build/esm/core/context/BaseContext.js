import { Emitter } from "../util/Emitter";
export class BaseContext extends Emitter {
    constructor() {
        super(...arguments);
        this.isOffline = false;
    }
}
//# sourceMappingURL=BaseContext.js.map