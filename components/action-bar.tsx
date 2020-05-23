import styled from 'styled-components';

const ActionBarBase = styled.div`
    padding: 12px;
    padding-left: 18px;
    background: #fdfdfd;
    position: fixed;
    top: 0;
    left: 0;
    &.bottom {
        bottom: 0;
        top: initial;
    }
    width: calc(100% - 30px);
    z-index: 30;
    box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 0.35);
    font-family: sans-serif;
    overflow-x: auto;
`;

export const ActionBarRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    > button {
        margin: 0px;
        margin-left: 16px;
    }
`;

const ActionBarDisplace = styled(ActionBarBase)`
    position: relative;
    &.bottom {
        margin-bottom: 0px;
        margin-top: auto;
        border-top: 8px solid rgba(0, 0, 0, 0);
        justify-self: flex-end;
    }
    z-index: 0;
    box-shadow: none;
    visibility: hidden;
    width: auto;
`;

export const ActionBarDivider = styled.hr`
    padding-left: 0px;
    margin-top: 8px;
    margin-bottom: 16px;
`;

export const ActionBar = props => (
    <>
        <ActionBarDisplace {...props} />
        <ActionBarBase {...props} />
    </>
);
