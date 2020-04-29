import styled from 'styled-components';

const ActionBarBase = styled.div`
    padding: 12px;
    min-height: 48px;
    padding-left: 18px;
    background: #f4f4f4;
    position: fixed;
    font-size: 20px;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 30;
    box-shadow: 2px 1px 10px 0px rgba(0, 0, 0, 0.35);
    font-family: sans-serif;

    button {
        margin: 0px;
        margin-left: 16px;
    }
`;

export const ActionBarRow = styled.div`
    display: flex;
    align-items: center;
`;

const ActionBarDisplace = styled(ActionBarBase)`
    position: relative;
    margin-bottom: 18px;
    z-index: 0;
    box-shadow: none;
`;

export const ActionBarDivider = styled.hr`
    padding-left: 0px;
    margin-top: 4px;
    margin-bottom: 12px;
`;

export const ActionBar = props => (
    <>
        <ActionBarDisplace {...props} />
        <ActionBarBase {...props} />
    </>
);
