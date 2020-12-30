import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import ActionListWithPopovers from 'components/action-list-with-popovers';
import {Flex} from 'components/box';
import TexturedCard from 'components/textured-card';
import {Milestone} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import React from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';


export default function MilestonesNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const state = useTypedSelector(state => state);
    const actionGuard = new ActionGuard(state, loggedInPlayer.username);

    const claimMilestone = (milestone: Milestone, payment?: PropertyCounter<Resource>) => {
        const [canPlay] = actionGuard.canClaimMilestone(milestone);
        if (canPlay) {
            apiClient.claimMilestoneAsync({milestone, payment});
        }
    };

    return (
        <ActionListWithPopovers<Milestone>
            id="milestones"
            actions={Object.values(Milestone)}
            ActionComponent={MilestoneBadge}
            ActionPopoverComponent={({
                action,
                closePopover,
            }: {
                action: Milestone;
                closePopover: () => void;
            }) => (
                <MilestonePopover
                    action={action}
                    claimMilestone={claimMilestone}
                    closePopover={closePopover}
                />
            )}
        />
    );
}

function MilestoneBadge({
    action,
    setSelectedAction,
    isSelected,
}: {
    action: Milestone;
    setSelectedAction: (action: Milestone | null) => void;
    isSelected: boolean;
}) {
    return (
        <div
            onClick={() => {
                setSelectedAction(isSelected ? null : action);
            }}
        >
            {getTextForMilestone(action)}
        </div>
    );
}

function MilestonePopover({
    action,
    closePopover,
    claimMilestone,
}: {
    action: Milestone;
    closePopover: () => void;
    claimMilestone: (milestone: Milestone, payment?: PropertyCounter<Resource>) => void;
}) {
    return (
        <TexturedCard>
            <Flex flexDirection="column">
                <button
                    onClick={() => {
                        claimMilestone(action);
                        closePopover();
                    }}
                >
                    Claim
                </button>
            </Flex>
        </TexturedCard>
    );
}
function getTextForMilestone(milestone: Milestone) {
    switch (milestone) {
        case Milestone.BUILDER:
            return 'Builder';
        case Milestone.GARDENER:
            return 'Gardener';
        case Milestone.PLANNER:
            return 'Planner';
        case Milestone.TERRAFORMER:
            return 'Terraformer';
        case Milestone.MAYOR:
            return 'Mayor';
        default:
            throw new Error('Unrecognized milestone');
    }
}
