export const Button = function(props) {
    const {children, onClick, ...rest} = props;

    return (
        <button onClick={onClick} style={rest}>
            {children}
        </button>
    );
};
