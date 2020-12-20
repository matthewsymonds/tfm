import React from 'react';
import {Card as CardModel} from 'models/card';
import styled from 'styled-components';
import {getResourceName} from 'constants/resource';
import {ResourceIcon} from 'components/icons/resource';

const StoredResourcesContainer = styled.div`
    position: absolute;
    left: 8px;
    bottom: 8px;
    height: 30px;
    width: 45px;
    border: 1px solid black;
    padding: 4px;
    display: flex;
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
                    <span>{card.storedResourceAmount}</span>
                    <ResourceIcon name={card.storedResourceType} />
                </StoredResourcesContent>
            </StoredResourcesContainer>
        </React.Fragment>
    );
};
