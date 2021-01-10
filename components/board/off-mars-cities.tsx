import {Board as BoardModel, Cell as CellModel, SpecialLocation} from 'constants/board';
import {Deck} from 'constants/card-types';
import React from 'react';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Cell} from './cell';

const OffMarsCityContainer = styled.div`
    position: absolute;
`;

type OffMarsCitiesProps = {
    board: BoardModel;
    validPlacements: CellModel[];
    handleClick: (cell: CellModel) => void;
};

type OffMarsCityProps = {
    cell: CellModel;
    offMarsCitiesProps: OffMarsCitiesProps;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
};

const px = (num?: number) => {
    return num ? `${num}px` : 'auto';
};

const OffMarsCity = ({cell, offMarsCitiesProps, top, left, right, bottom}: OffMarsCityProps) => (
    <OffMarsCityContainer
        style={{top: px(top), left: px(left), bottom: px(bottom), right: px(right)}}
        onClick={() => offMarsCitiesProps.handleClick(cell)}
    >
        <Cell selectable={offMarsCitiesProps.validPlacements.includes(cell)} cell={cell} />
    </OffMarsCityContainer>
);

function OffMarsCities(props: OffMarsCitiesProps) {
    const cells = props.board.flat();
    const ganymede = cells.find(cell => cell.specialLocation === SpecialLocation.GANYMEDE)!;
    const phobos = cells.find(cell => cell.specialLocation === SpecialLocation.PHOBOS)!;
    const venus = useTypedSelector(state => state.options?.decks.includes(Deck.VENUS));

    return (
        <>
            <OffMarsCity cell={ganymede} offMarsCitiesProps={props} right={15} top={15} />
            <OffMarsCity cell={phobos} offMarsCitiesProps={props} left={15} bottom={15} />
            {venus ? (
                <>
                    {[
                        SpecialLocation.DAWN_CITY,
                        SpecialLocation.LUNA_METROPOLIS,
                        SpecialLocation.MAXWELL_BASE,
                        SpecialLocation.STRATOPOLIS,
                    ].map((specialLocation, index) => {
                        const cell = cells.find(
                            thisCell => thisCell.specialLocation === specialLocation
                        );
                        return (
                            <OffMarsCity
                                cell={cell!}
                                key={specialLocation}
                                offMarsCitiesProps={props}
                                right={index * 75 + 15}
                                bottom={15}
                            />
                        );
                    })}
                </>
            ) : null}
        </>
    );
}

export default OffMarsCities;
