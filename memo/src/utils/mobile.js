import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

export const IsMobile = () => {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.down("xs"));
};