import cron from 'node-cron';
import { SaveOneYearOldDataArchive, SaveOneYearOldDataSummary } from '../modules/data_archive/data_archive.controller';
cron.schedule('10 16 * * *', async () => {
    console.log(`⏰ Cron triggered at ${new Date().toLocaleString()}`);
    try {
        await Promise.all([
            SaveOneYearOldDataArchive({}, {
                status: () => ({ json: (data) => console.log('archive table:', data) }),
            }),
            SaveOneYearOldDataSummary({}, {
                status: () => ({ json: (data) => console.log('summary table done:', data) }),
            }),
        ]);
    }
    catch (err) {
        console.error('Cron error:', err);
    }
}, {
    timezone: 'Asia/Manila',
});
//01 15 * 01 01
