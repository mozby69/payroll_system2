import cron from 'node-cron';
import { SaveOneYearOldDataArchive,SaveOneYearOldDataSummary } from '../modules/data_archive/data_archive.controller';


cron.schedule('10 16 * * *', async () => {
    console.log(`⏰ Cron triggered at ${new Date().toLocaleString()}`);
    try {
      await Promise.all([
        SaveOneYearOldDataArchive({} as any, {
          status: () => ({ json: (data: any) => console.log('archive table:', data) }),
        } as any),

        SaveOneYearOldDataSummary({} as any, {
          status: () => ({ json: (data: any) => console.log('summary table done:', data) }),
        } as any),
      ]);
    } catch (err) {
      console.error('Cron error:', err);
    }
  },
  {
    timezone: 'Asia/Manila',
  }
);


//01 15 * 01 01