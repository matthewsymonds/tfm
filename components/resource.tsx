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
import {Checkbox, Pane} from 'evergreen-ui';
import {Tag} from 'constants/tag';
import {TagIcon} from 'components/tags';

interface ResourceIconBaseProps {
    readonly color: string;
    readonly background: string;
    readonly tall?: boolean;
}

const ResourceIconBase = styled.div<ResourceIconBaseProps>`
  display: inline-block;
  height: ${props => (props.tall ? '30px' : '20px')};
  width 20px;
  text-align: center;
  margin: 3px;
  font-size: 14px;
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
}

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({name, className}) => (
    <ResourceIconBase
        color={getResourceColor(name)}
        className={className}
        tall={name === Resource.CARD}
        background={getResourceBackgroundColor(name)}
    >
        <span className={getClassName(name)}>{getResourceSymbol(name)}</span>
    </ResourceIconBase>
);

const ResourceBoardCellBase = styled.div<{isTagCounter: boolean}>`
    display: flex;
    width: 60px;
    border-radius: 3px;
    border-top-left-radius: ${props => (props.isTagCounter ? '28px' : '')};
    border-bottom-left-radius: ${props => (props.isTagCounter ? '28px' : '')};
    margin-right: 10px;
    align-items: center;
    padding: 4px;
    background-color: #f1f1f1;
    box-shadow: 1px 1px 2px 0px #4d4d4d;
    border: 1px solid rgba(197, 197, 197, 0.38);

    .row {
        display: flex;
    }
    .amount {
        display: inline-flex;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: auto;
        padding: 2px;
    }
`;

export type ResourceBoardCellProps =
    | {
          amount: number;
          resource: Resource;
          tag?: undefined;
      }
    | {
          amount: number;
          tag: Tag;
          resource?: undefined;
      };

export const InlineResourceIcon = styled(ResourceIcon)`
    display: inline-flex;
    flex-shrink: 0;
    margin: 0;
    height: 20px;
    width 20px;
    font-size: 16px;
    border: 1px solid #222;
`;

export const ResourceBoardCell: React.FunctionComponent<ResourceBoardCellProps> = ({
    amount,
    resource,
    tag,
}) => {
    return (
        <>
            <ResourceBoardCellBase isTagCounter={!!tag}>
                {resource && <InlineResourceIcon name={resource} />}
                {tag && <TagIcon name={tag} />}
                <div className="amount">{amount}</div>
            </ResourceBoardCellBase>
        </>
    );
};

export const ResourceBoardRow = styled.div`
    display: flex;
    align-items: flex-start;
    &:first-child {
        margin-bottom: 10px;
    }
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
    const [isShowingProduction, setIsShowingProduction] = useState(false);
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
                                amount={
                                    isShowingProduction
                                        ? player.productions[resource]
                                        : player.resources[resource]
                                }
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
                                    amount={
                                        isShowingProduction
                                            ? player.productions[resource]
                                            : player.resources[resource]
                                    }
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
            <Checkbox
                checked={isShowingProduction}
                onChange={() => setIsShowingProduction(!isShowingProduction)}
                marginTop={16}
                label="Show productions"
            />
        </Pane>
    );
};
