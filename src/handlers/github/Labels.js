import LabelHelper from '../../helpers/labels'

function Labels(payload, reviewCount) {
	if (payload.action === 'labeled') {
		return LabelHelper.handleAddLabel(payload)
	}

	if (payload.action === 'unlabeled') {
		return LabelHelper.handleUnlabel(payload, reviewCount)
	}

	return 'Got a label change'
}

export default Labels
