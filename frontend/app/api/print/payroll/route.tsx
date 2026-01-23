import { payrollPrintHtml } from "@/app/components/reports/payrollPrintHtml";
import { payslipHtml } from "@/app/components/reports/payslipHtml";
import puppeteer from "puppeteer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const {
    type,
    data,
    paper = "A4",
    orientation = "landscape",
  } = await req.json();

  if (!type || !data) {
    return new Response("Invalid request", { status: 400 });
  }

  let html = "";

  if (type === "payroll") {
    if (!Array.isArray(data) || data.length === 0) {
      return new Response("Empty payroll data", { status: 400 });
    }
    html = payrollPrintHtml(data);
  }

  if (type === "payslip") {
    html = payslipHtml(data);
  }

  if (!html) {
    return new Response("Invalid print type", { status: 400 });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  

  try {
    const page = await browser.newPage();

    await page.setContent(`
      <html>
        <head>
          <style>
            @page { size: ${paper} ${orientation}; margin: 3mm; }
            body { font-family: Arial, sans-serif; font-size: 9pt; }
            .payslip {
                display: flex;
                font-size: 11px;
                gap: .5rem;
                font-weight: 500; 
                max-height: 265px;
            }
            .payslip-main {
                position: relative;
                display: flex;
                flex-direction: column;
                width: 70%;
                border: thin solid black;
            }
            .payslip-company{
              padding: 1px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .payslip-details{
              display: flex;
              flex-direction: column;
            }
            .payslip-details p{
              margin: 0px;
              padding: 5px;
            }

            .payslip-details1{
              display: flex;
              gap: 1.6rem;
            }
            .payslip-details2{
              display: flex;
            }
            .payslip-company p{
              margin: 0px;
              padding: 0px;
            }
            .payslip-table {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              grid-template-rows: repeat(4, 1fr);
              grid-column-gap: 0px;
              grid-row-gap: 0px;
            }
          .payslip-table > div {
              border: 1px solid black;
              padding: 7px;
          }

          .payslip-acknowledge {
              border: .2px dotted black;
              padding: 4px;
              width: 30%;
              display: flex;
              flex-direction: column;
                justify-content: space-between;
          }
              .border-bottom{
                border-bottom: none;
              }
              .border-none{
                border: none;
              }
              .border-inline{
                border-inline: none;
              }
              .border-block{
                border-block: none;
              }

        .flex {
          display: flex;
        }
        .flex-col{
             flex-direction: column;
          }

          .justify-between {
            justify-content: space-between;
          }

          .p-0 p{
            padding: 3px;
            margin: 0px;
          }
            .bg-red{
              background-color: red;
            }
              .p-2{
                line-height: 10ox;
              }

          </style>
        </head>
        <body>${html}</body>
      </html>
    `);

    const pdf = await page.pdf({
      format: paper,
      landscape: orientation === "landscape",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new Response(pdf, {
      headers: { "Content-Type": "application/pdf" },
    });
  } finally {
    await browser.close();
  }
}
