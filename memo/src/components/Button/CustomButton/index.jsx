import React from 'react'
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const StyledButton = withStyles({
    root:{
        borderRadius: '20px',
        color: 'white',
        fontWeight: '600',
        fontStyle: 'normal',
    }
})(props => <Button {...props} />);

export default function CustomButton(props) {
    return <StyledButton {...props}>{props.children}</StyledButton>;
}
