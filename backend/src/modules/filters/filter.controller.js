import { getFilterOptions } from "./filter.services";
export const getEmployeeFilters = async (_req, res) => {
    try {
        const data = await getFilterOptions();
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load filters" });
    }
};
