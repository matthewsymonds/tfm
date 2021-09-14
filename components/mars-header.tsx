import Link from 'next/link';
import styled from 'styled-components';

const MarsBase = styled.div`
    width: 27px;
    height: 25px;
    border-radius: 50%;
    background: #8b2405;
    margin: 25px;
    position: relative;
`;

const MarsOuter = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    &:hover > * {
        box-shadow: 1px 0px 50px 0px #a11b05;
        &:before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: -1;
            margin: -1px; /* !importanté */
            border-radius: inherit; /* !importanté */
            background: linear-gradient(to left, orangered, #a11b05);
        }
    }
`;

export const MarsHeader = () => {
    return (
        <Link href="/">
            <a>
                <MarsOuter>
                    <MarsBase />
                </MarsOuter>
            </a>
        </Link>
    );
};
