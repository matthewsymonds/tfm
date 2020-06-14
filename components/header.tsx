import styled from 'styled-components';

export const HeaderBase = styled.nav`
    padding: 18px;
    background: #c63832;
    font-size: 22px;
    font-weight: bold;
    lcolor: #f0f0f0;
`;

export const Header = () => <HeaderBase>Terraforming Mars Online</HeaderBase>;
