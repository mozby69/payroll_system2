import { getCompaniesByCode, getCompaniesByCycle, getCompanyDetailsServices } from "./general.services";
import { getBrowser } from "../../utils/pdfBrowser";
export async function getCompanyDetailsController(req, res) {
    try {
        const companyDetails = await getCompanyDetailsServices();
        return res.status(200).json(companyDetails);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to company details"
        });
    }
}
export async function getCompaniesByCycleController(req, res) {
    try {
        const { cycle } = req.query;
        if (!cycle || typeof cycle !== "string") {
            return res.status(400).json({ message: "cycle is required" });
        }
        const result = await getCompaniesByCycle(cycle);
        return res.json({ success: true, data: result });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch companies" });
    }
}
export async function getCompaniesByCodeController(req, res) {
    try {
        const CompanyCode = req.params.CompanyCode;
        if (!CompanyCode || typeof CompanyCode !== "string") {
            return res.status(400).json({ message: "code is required" });
        }
        const result = await getCompaniesByCode(CompanyCode);
        return res.json({ success: true, data: result });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch companies" });
    }
}
export const generatePdfController = async (req, res) => {
    try {
        const { path, download } = req.query;
        if (!path || typeof path !== "string") {
            return res.status(400).send("Missing path parameter");
        }
        const browser = await getBrowser();
        const page = await browser.newPage();
        //const fullUrl = `http://localhost:3000${path}`;
        const fullUrl = `${process.env.FRONTEND_URL}${path}`;
        await page.goto(fullUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        await page.waitForSelector("#pdf-ready");
        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "2mm",
                bottom: "2mm",
            },
        });
        await page.close(); // close page only
        res.setHeader("Content-Type", "application/pdf");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="Allowance.pdf"`);
        }
        else {
            res.setHeader("Content-Disposition", "inline");
        }
        res.send(pdf);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("PDF generation failed");
    }
};
