import LabelHelper from '../../helpers/labels'

function Labels(payload) {
	if (payload.action === 'labeled') {
		return LabelHelper.handleAddLabel(payload)
	}

	if (payload.action === 'unlabeled') {
		return LabelHelper.handleUnlabel(payload)
	}

	return 'Got a label change'
}

export default Labels
