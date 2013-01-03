from orm_signal_handler import orm_signal_handler
from exceptions import BusinessRuleException
from specify import models

@orm_signal_handler('pre_save')
def set_rankid(sender, obj):
    if hasattr(obj, 'definitionitem'):
        obj.rankid = obj.definitionitem.rankid
        obj.definition = obj.definitionitem.treedef

    if hasattr(obj, 'parent') and obj.parent is not None:
        if obj.parent.rankid >= obj.rankid:
            raise BusinessRuleException('Tree object has parent with rank not greater than itself.')

@orm_signal_handler('pre_delete', 'Geographytreedefitem')
def cannot_delete_root(geographytreedefitem):
    if models.Geographytreedefitem.objects.get(id=geographytreedefitem.id).parent is None:
        raise BusinessRuleException("cannot delete root level geograpty tree definition item")

