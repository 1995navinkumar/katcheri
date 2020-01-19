import React from "react";
import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar, SnackbarContent } from '@material-ui/core';


export default class Alert extends React.Component {
    render(props) {
        return (
            <SnackbarContent
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                message="I love snacks." />
        );
    }
}