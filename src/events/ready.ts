import { IEvent } from "../bot";

export default new class implements IEvent {
    name = "ready";
    once = true;
    execute = async () => {
        console.log("ログイン完了！");
    };
};