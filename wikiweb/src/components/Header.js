import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import React from "react";

const Header = () => {
    return(
        <AppBar position="static">
            <Toolbar>
                <Typography color="inherit">
                    This will be something
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Header