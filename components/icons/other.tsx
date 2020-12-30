import {AllCapsIcon} from 'components/icons/global-parameter';
import React from 'react';

// TODO: make proper icons for these
export const TerraformRatingIcon = ({
    size = 16,
    margin = 0,
}: {
    size?: number;
    margin?: string | number;
}) => {
    return (
        <AllCapsIcon size={size} bgColor="#f59038" margin={margin}>
            TR
        </AllCapsIcon>
    );
};

export const ColonyIcon = ({size = 16, margin = 0}: {size?: number; margin?: string | number}) => {
    return (
        <AllCapsIcon size={size} bgColor="#ccc" margin={margin}>
            COL
        </AllCapsIcon>
    );
};
