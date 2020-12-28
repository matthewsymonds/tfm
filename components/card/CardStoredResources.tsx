import {ResourceIcon} from 'components/icons/resource';
import {colors} from 'components/ui';
import {Card as CardModel} from 'models/card';
import React from 'react';
import styled from 'styled-components';

const StoredResourcesContainer = styled.div`
    position: absolute;
    left: 8px;
    bottom: 8px;
    height: 30px;
    width: 45px;
    border: 1px solid ${colors.CARD_BORDER_2};
    padding: 4px;
    display: flex;
    background-color: ${colors.CARD_STORED_RESOURCES_BG};
    align-items: center;
    justify-content: center;
`;

const StoredResourcesContent = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: black;
    display: flex;
    align-items: center;
`;

type CardStoredResourcesProps = {
    card: CardModel;
};

export const CardStoredResources = ({card}: CardStoredResourcesProps) => {
    if (!card.storedResourceType || !card.storedResourceAmount) {
        return null;
    }
    return (
        <React.Fragment>
            <StoredResourcesContainer>
                <StoredResourcesContent>
                    <span style={{marginRight: 4}}>{card.storedResourceAmount}</span>
                    <ResourceIcon name={card.storedResourceType} />
                </StoredResourcesContent>
            </StoredResourcesContainer>
        </React.Fragment>
    );
};
