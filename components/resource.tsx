import {ResourceIcon} from 'components/icons/resource';
import {colors} from 'components/ui';
import {CONVERSIONS} from 'constants/conversion';
import {Resource} from 'constants/resource';
import {Pane} from 'evergreen-ui';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {PlayerState, useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import styled from 'styled-components';
import {ConversionButton} from './conversion-button';

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
    width: 20px;
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

export const PlayerResourceBoard = ({
    player,
    isLoggedInPlayer,
    plantConversionOnly,
}: PlayerResourceBoardProps) => {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

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
                        const [canDoConversion] = actionGuard.canDoConversion(conversion);

                        const canDoConversionInSpiteOfUI = useTypedSelector(state => {
                            if (!conversion) {
                                return false;
                            }

                            return actionGuard.canPlayActionInSpiteOfUI(conversion, state)[0];
                        });

                        const quantityToRemove = useTypedSelector(state =>
                            convertAmountToNumber(
                                conversion?.removeResource[conversion.resourceToRemove] ?? 0,
                                state,
                                player
                            )
                        );

                        return (
                            <div key={resource}>
                                <ResourceBoardCell
                                    resource={resource}
                                    amount={player.resources[resource]}
                                    production={player.productions[resource]}
                                />
                                {isLoggedInPlayer &&
                                quantityToRemove &&
                                canDoConversionInSpiteOfUI &&
                                (!plantConversionOnly || resource === Resource.PLANT) ? (
                                    <ConversionButton
                                        disabled={
                                            !canDoConversion ||
                                            actionGuard.shouldDisableValidGreeneryPlacementUI()
                                        }
                                        onClick={() => apiClient.doConversionAsync({resource})}
                                    >
                                        Convert {quantityToRemove}
                                    </ConversionButton>
                                ) : null}
                            </div>
                        );
                    })}
                </ResourceBoardRow>
            </ResourceBoard>
        </Pane>
    );
};
