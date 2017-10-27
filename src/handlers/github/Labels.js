import LabelHelper from '../../helpers/labels'

function Labels(payload, reviewCount) {
	// Handle a label being added (to issue or PR)
	if (payload.action === 'labeled') {
		return LabelHelper.handleAddLabel(payload)
	}

	// Handle a label being removed (from issue or PR)
	if (payload.action === 'unlabeled') {
		return LabelHelper.handleUnlabel(payload, reviewCount)
	}

	return 'Got a label change'
}

export default Labels
