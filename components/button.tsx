export const Button = function(props) {
    const {children, onClick, disabled, ...rest} = props;

    return (
        <button onClick={onClick} disabled={disabled} style={rest}>
            {children}
        </button>
    );
};
