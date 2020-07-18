import styled from 'styled-components';

export const HeaderBase = styled.nav`
    padding: 18px;
    background: #f8bcae;
    font-size: 28px;
    font-weight: bold;
    color: #1d1d1d;
    font-variant-caps: small-caps;
    letter-spacing: 2px;
`;

export const Header = () => <HeaderBase>Terraforming Mars Online</HeaderBase>;
