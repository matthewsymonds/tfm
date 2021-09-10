import {Flex} from 'components/box';
import {Board as BoardModel, Cell as CellModel, SpecialLocation} from 'constants/board';
import {Deck} from 'constants/card-types';
import React from 'react';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Cell} from './cell';

const OffMarsCityContainer = styled.div`
    position: relative;
    margin: 0 calc(100 / 90 * 100% / (4 * 10 * 10));
    flex: 0 0 calc(100 / 90 * 100% / 10);
`;

type OffMarsCitiesProps = {
    board: BoardModel;
    validPlacements: CellModel[];
    handleClick: (cell: CellModel) => void;
};

type OffMarsCityProps = {
    cell: CellModel;
    offMarsCitiesProps: OffMarsCitiesProps;
};

const px = (num?: number) => {
    return num ? `${num}px` : 'auto';
};

export const OffMarsCity = ({cell, offMarsCitiesProps}: OffMarsCityProps) => (
    <OffMarsCityContainer onClick={() => offMarsCitiesProps.handleClick(cell)}>
        <Cell selectable={offMarsCitiesProps.validPlacements.includes(cell)} cell={cell} />
    </OffMarsCityContainer>
);

function OffMarsCities(props: OffMarsCitiesProps) {
    const cells = props.board.flat();
    const venus = useTypedSelector(state => state.options?.decks.includes(Deck.VENUS));
    const phobos = cells.find(cell => cell.specialLocation === SpecialLocation.PHOBOS)!;

    return (
        <Flex
            justifyContent="space-between"
            width="90%"
            marginTop="4%"
            marginLeft="auto"
            marginRight="auto"
        >
            <OffMarsCity cell={phobos} offMarsCitiesProps={props} />

            {venus
                ? [
                      SpecialLocation.DAWN_CITY,
                      SpecialLocation.LUNA_METROPOLIS,
                      SpecialLocation.MAXWELL_BASE,
                      SpecialLocation.STRATOPOLIS,
                  ].map(specialLocation => {
                      const cell = cells.find(
                          thisCell => thisCell.specialLocation === specialLocation
                      );
                      return (
                          <OffMarsCity
                              cell={cell!}
                              key={specialLocation}
                              offMarsCitiesProps={props}
                          />
                      );
                  })
                : null}
        </Flex>
    );
}

export default OffMarsCities;
