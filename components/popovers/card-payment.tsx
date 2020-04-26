import {ChangeEvent} from 'react';
import {Popover} from 'reactstrap';
import styled from 'styled-components';
import {Card} from '../../models/card';
import {useLoggedInPlayer} from '../../selectors/players';
import {Tag} from '../../constants/tag';
import {Resource} from '../../constants/resource';
import {useState} from 'react';
import {getDiscountedCardCost} from '../../context/app-context';
import {PropertyCounter} from '../../constants/property-counter';

type Props = {
    isOpen: boolean;
    target: string | null;
    card: Card;
    toggle: () => void;
    onConfirmPayment: (payment: PropertyCounter<Resource>) => void;
};

const CardPaymentBase = styled.div`
    padding: 16px;
    border-radius: 3px;
    border: 2px solid #eee;
    background: white;
`;

const CardPaymentRow = styled.div`
    display: flex;
    justify-content: space-between;
    input {
        width: 40px;
        margin-left: 16px;
    }
`;

const CardConfirmationRow = styled.div<{isValidPayment: boolean}>`
    display: flex;
    border-top: 1px solid black;
    font-weight: 600;
    justify-content: space-between;
    .running-total {
        color: ${props => (props.isValidPayment ? 'black' : 'red')};
    }
`;

export default function CardPaymentPopover({
    isOpen,
    target,
    toggle,
    card,
    onConfirmPayment
}: Props) {
    const player = useLoggedInPlayer();
    const {resources, discounts, exchangeRates} = player;
    const cardCost = getDiscountedCardCost(card, player);
    const [numMC, setNumMC] = useState(Math.min(resources[Resource.MEGACREDIT], cardCost || 0));
    const [numSteel, setNumSteel] = useState(0);
    const [numTitanium, setNumTitanium] = useState(0);

    function handleInputChange(e: ChangeEvent<HTMLInputElement>, resource: Resource) {
        const proposedValue = parseInt(e.target.value || '0');
        // if they're trying to spend resources they don't have, disallow it
        if (proposedValue > resources[resource]) {
            return;
        }

        const currentRunningTotal = calculateRunningTotal();
        if (currentRunningTotal > cardCost) {
            return;
        }
        const proposedRunningTotal = calculateRunningTotal({[resource]: proposedValue});
        let newMC = numMC;
        if (proposedRunningTotal > cardCost) {
            // attempting to overpay. disallow this for megacredits
            if (resource === Resource.MEGACREDIT) return;
            // otherwise, reduce megacredits accordingly
            const delta = proposedRunningTotal - cardCost;
            newMC = Math.max(0, numMC - delta);
            setNumMC(newMC);
        }

        switch (resource) {
            case Resource.MEGACREDIT:
                setNumMC(proposedValue);
                return;
            case Resource.STEEL:
                setNumSteel(proposedValue);
                break;
            case Resource.TITANIUM:
                setNumTitanium(proposedValue);
                break;
            default:
                throw new Error('Unrecognized resource type');
        }

        // finally, bump up MC to cover any remaining delta
        const delta =
            cardCost! -
            calculateRunningTotal({
                [Resource.MEGACREDIT]: newMC,
                [resource]: proposedValue
            });
        if (delta > 0) {
            setNumMC(Math.min(newMC + delta, resources[Resource.MEGACREDIT]));
        }
    }

    function calculateRunningTotal(overrides: {[k in Resource]?: number} = {}) {
        return (
            (overrides[Resource.MEGACREDIT] ?? numMC) +
            (overrides[Resource.STEEL] ?? numSteel) * exchangeRates[Resource.STEEL] +
            (overrides[Resource.TITANIUM] ?? numTitanium) * exchangeRates[Resource.TITANIUM]
        );
    }

    const isValidPayment = cardCost <= calculateRunningTotal();

    return (
        <Popover placement="right" isOpen={isOpen} target={target} toggle={toggle}>
            <CardPaymentBase>
                <CardPaymentRow>
                    <div>Megacredit ({resources[Resource.MEGACREDIT]})</div>
                    <div>
                        <input
                            type="number"
                            value={numMC}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleInputChange(e, Resource.MEGACREDIT)
                            }
                            min="0"
                            max={resources[Resource.MEGACREDIT]}
                        />
                        <span>
                            <em>{numMC} MC</em>
                        </span>
                    </div>
                </CardPaymentRow>
                {card.tags.includes(Tag.BUILDING) && (
                    <CardPaymentRow>
                        <div>Steel ({resources[Resource.STEEL]})</div>
                        <div>
                            <input
                                type="number"
                                value={numSteel}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleInputChange(e, Resource.STEEL)
                                }
                                min="0"
                                max={resources[Resource.STEEL]}
                            />
                            <span>
                                <em>{numSteel * exchangeRates[Resource.STEEL]} MC</em>
                            </span>
                        </div>
                    </CardPaymentRow>
                )}
                {card.tags.includes(Tag.SPACE) && (
                    <CardPaymentRow>
                        <div>Titanium ({resources[Resource.TITANIUM]})</div>
                        <div>
                            <input
                                type="number"
                                value={numTitanium}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleInputChange(e, Resource.TITANIUM)
                                }
                                min="0"
                                max={resources[Resource.TITANIUM]}
                            />
                            <span>
                                <em>{numTitanium * exchangeRates[Resource.TITANIUM]} MC</em>
                            </span>
                        </div>
                    </CardPaymentRow>
                )}
                <CardConfirmationRow isValidPayment={isValidPayment}>
                    <span>Total cost: {cardCost} MC</span>
                    <span className="running-total">
                        <em>{calculateRunningTotal()} MC</em>
                    </span>
                </CardConfirmationRow>
                <button
                    disabled={!isValidPayment}
                    onClick={() =>
                        onConfirmPayment({
                            [Resource.MEGACREDIT]: numMC,
                            [Resource.STEEL]: numSteel,
                            [Resource.TITANIUM]: numTitanium
                        })
                    }
                >
                    Confirm
                </button>
            </CardPaymentBase>
        </Popover>
    );
}
