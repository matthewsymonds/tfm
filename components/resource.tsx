import styled from 'styled-components';
import {
    getResourceBackgroundColor,
    getResourceColor,
    getClassName,
    getResourceSymbol,
    Resource,
} from 'constants/resource';

import {Conversion, CONVERSIONS} from 'constants/conversion';
import {PlayerState} from 'reducer';
import {useContext, useState} from 'react';
import {AppContext} from 'context/app-context';
import {ConversionLink} from './conversion-link';
import {useStore, useDispatch} from 'react-redux';
import {Pane} from 'evergreen-ui';
import {colors} from 'components/ui';

interface ResourceIconBaseProps {
    readonly color: string;
    readonly background: string;
    readonly size: number;
    readonly tall?: boolean;
}

const ResourceIconBase = styled.div<ResourceIconBaseProps>`
  display: inline-block;
  height: ${props => (props.tall ? props.size * 1.5 : props.size)}px;
  width ${props => props.size}px;
  text-align: center;
  margin: 3px;
  font-size: ${props => props.size}px;
  font-weight: bold;
  color: ${props => props.color};
  background: ${props => props.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ResourceIconProps {
    name: Resource;
    className?: string;
    size?: number;
}

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({
    name,
    className,
    size = 20,
}) => (
    <ResourceIconBase
        color={getResourceColor(name)}
        className={className}
        tall={name === Resource.CARD}
        size={size}
        background={getResourceBackgroundColor(name)}
    >
        <span className={getClassName(name)}>{getResourceSymbol(name)}</span>
    </ResourceIconBase>
);

const ResourceBoardCellBase = styled.div`
    display: flex;
    align-items: center;
    padding: 8px;
    font-size: 12px;
    background-color: ${colors.RESOURCE_COUNTER_BG};
    margin: 2px;

    .row {
        display: flex;
    }

    .amount,
    .production {
        display: inline-flex;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: auto;
        padding: 2px;
        width: 22px;
    }

    .amount {
        color: ${colors.TEXT_DARK_1};
    }

    .production {
        background: #f5923b;
    }
`;

export const InlineResourceIcon = styled(ResourceIcon)`
    display: inline-flex;
    flex-shrink: 0;
    margin: 0;
    height: 20px;
    width 20px;
    font-size: 16px;
    border: 1px solid #222;
`;

export type ResourceBoardCellProps = {
    resource: Resource;
    amount: number;
    production: number;
};

export const ResourceBoardCell = ({amount, production, resource}: ResourceBoardCellProps) => {
    return (
        <ResourceBoardCellBase>
            <InlineResourceIcon name={resource} />
            <div className="amount">{amount}</div>
            <div className="production">{production}</div>
        </ResourceBoardCellBase>
    );
};

export const ResourceBoardRow = styled.div`
    display: flex;
    align-items: flex-start;
`;

export const ResourceBoard = styled.div`
    display: flex;
    flex-direction: column;
`;

type PlayerResourceBoardProps = {
    player: PlayerState;
    isLoggedInPlayer: boolean;
    plantConversionOnly?: boolean;
};

export function getConversionAmount(player: PlayerState, conversion: Conversion) {
    for (const resource in conversion?.removeResource ?? {}) {
        const amountToRemove = conversion?.removeResource![resource]!;
        if (resource === Resource.PLANT) {
            return amountToRemove - (player.plantDiscount || 0);
        }

        return amountToRemove;
    }
    return Infinity;
}

export const PlayerResourceBoard = ({
    player,
    isLoggedInPlayer,
    plantConversionOnly,
}: PlayerResourceBoardProps) => {
    const context = useContext(AppContext);
    const store = useStore();
    const state = store.getState();
    const dispatch = useDispatch();

    return (
        <Pane display="flex" flexDirection="column">
            <ResourceBoard>
                <ResourceBoardRow>
                    {[Resource.MEGACREDIT, Resource.STEEL, Resource.TITANIUM].map(resource => {
                        return (
                            <ResourceBoardCell
                                key={resource}
                                resource={resource}
                                amount={player.resources[resource]}
                                production={player.productions[resource]}
                            />
                        );
                    })}
                </ResourceBoardRow>
                <ResourceBoardRow>
                    {[Resource.PLANT, Resource.ENERGY, Resource.HEAT].map(resource => {
                        const conversion = CONVERSIONS[resource];
                        return (
                            <div key={resource}>
                                <ResourceBoardCell
                                    resource={resource}
                                    amount={player.resources[resource]}
                                    production={player.productions[resource]}
                                />
                                {isLoggedInPlayer &&
                                context.canDoConversion(
                                    conversion,
                                    player,
                                    resource,
                                    getConversionAmount(player, conversion),
                                    state
                                ) &&
                                (!plantConversionOnly || resource === Resource.PLANT) ? (
                                    <>
                                        <ConversionLink
                                            onClick={() =>
                                                context.doConversion(
                                                    state,
                                                    player.index,
                                                    dispatch,
                                                    conversion
                                                )
                                            }
                                        >
                                            Convert {getConversionAmount(player, conversion)}
                                        </ConversionLink>
                                    </>
                                ) : null}
                            </div>
                        );
                    })}
                </ResourceBoardRow>
            </ResourceBoard>
        </Pane>
    );
};
