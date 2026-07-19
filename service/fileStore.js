const fs = require('fs');
const fsPromises = require('node:fs/promises');
const path = require('path');

const lockfile = require('proper-lockfile');

const { outputDir } = require('../config/constants');

class FileStore {
    #MAX_RETENTION_MS = 1000;

    constructor(dbPath = path.join(__dirname, '../data/fileStore.json')) {
        this.dbPath = dbPath;
        this._ensureFile();
    }

    // 確保檔案存在
    _ensureFile() {
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
            fs.writeFileSync(this.dbPath, '[]', 'utf-8');
        }
    }

    // 讀取全部資料
    async readAll() {
        try{
            const raw = await fsPromises.readFile(this.dbPath, 'utf-8');
            return JSON.parse(raw);

        }catch(error){
            console.log(error)
            return []
        }
    }

    // 寫入全部資料
    async writeAll(data) {
        try{
            const release = await lockfile.lock(this.dbPath, {
                retries: { retries: 10, minTimeout: 50 },
                stale: 10000,
            });
            await fsPromises.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8')
            release()
        }catch(error){
            console.error(error)
        }
    }

    // 新增一筆排程檔案紀錄
    async addFileData(fileName) {
        const data = await this.readAll();
        const record = {
            fileName,
            createdAt: Date.now(),
        };
        data.push(record);
        this.writeAll(data);
    }

    // 移除過期檔案
    async cleanOldFiles() {
        const data = await this.readAll();
        const now = Date.now();
        const expiredFilesData = data.filter(r => now - Number(r.createdAt) >= this.#MAX_RETENTION_MS);
        const nonExpiredFilesData = data.filter(r => now - Number(r.createdAt) < this.#MAX_RETENTION_MS);
        const unlinkPromises = expiredFilesData.map(async (e) => {  // 加上 async
            try {
                const absolutePath = path.resolve(__dirname, `../${outputDir}${e.fileName}`)
                await fsPromises.unlink(absolutePath); // 用 e 裡面實際的路徑，不是寫死字串
            } catch (error) {
                console.error(`刪除檔案失敗: ${e.fileName}`, error);
            }
        });

        await Promise.all(unlinkPromises);
        
        this.writeAll(nonExpiredFilesData)
    }
}

const FileStoreInstance = new FileStore()

module.exports = FileStoreInstance