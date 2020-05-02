import styled from 'styled-components';

const ActionBarBase = styled.div`
    padding: 12px;
    min-height: 48px;
    padding-left: 18px;
    background: #f4f4f4;
    position: fixed;
    top: 0;
    left: 0;
    &.bottom {
        bottom: 0;
        top: initial;
    }
    width: calc(100% - 30px);
    z-index: 30;
    box-shadow: 2px 1px 10px 0px rgba(0, 0, 0, 0.35);
    font-family: sans-serif;
`;

export const ActionBarRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    > button {
        margin: 0px;
        margin-left: 16px;
    }
`;

const ActionBarDisplace = styled(ActionBarBase)`
    position: relative;
    margin-bottom: 18px;
    z-index: 0;
    box-shadow: none;
    * {
        visibility: hidden;
    }
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
