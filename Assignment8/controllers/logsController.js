import Log from "../models/Log.js";

export const addLog = async (req, res) => {

    const log = await Log.create({
        message: "Future"
    });

    res.json(log);
};