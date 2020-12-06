import React from 'react';
import {AllCapsIcon} from 'components/icons/global-parameter';

// HACK: make a proper icon for this
export const TerraformRatingIcon = ({size = 16}: {size?: number}) => {
    return (
        <AllCapsIcon size={size} bgColor="#f59038">
            TR
        </AllCapsIcon>
    );
};

export const ColonyIcon = ({size = 16}: {size?: number}) => {
    return (
        <AllCapsIcon size={size} bgColor="#ccc">
            COL
        </AllCapsIcon>
    );
};