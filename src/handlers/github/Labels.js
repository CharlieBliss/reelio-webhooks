import LabelHelper from '../../helpers/labels'

function Label(payload) {
	if (payload.action === 'labeled') {
		return LabelHelper.handleAddLabel(payload)
	}

	if (payload.action === 'unlabeled') {
		return LabelHelper.handleUnlabel(payload)
	}

	return 'Got a label change'
}

export default Label
