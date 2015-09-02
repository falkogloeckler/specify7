define(['q', 'underscore'], function(Q, _) {
    "use strict";

    function buildFullName(resource, acc, start, parent, defitem) {
        if (parent && (parent.get('rankid') >= resource.get('rankid'))) {
            return Q.reject('Bad tree structure.');
        }
        if (start || defitem.get('isinfullname')) acc.push(resource.get('name'));
        if (parent == null) {
            return acc;
        } else {
            return Q.all([parent, acc, false,
                          parent.getRelated('parent', {prePop: true, noBusinessRules: true}),
                          parent.getRelated('definitionitem', {prePop: true, noBusinessRules: true})
                         ]).spread(buildFullName);
        }
    };

    var treeBusinessRules = {
        isTreeNode: function(resource) {
            var model;
            model = resource.specifyModel;
            return _.all(['parent', 'definition', 'definitionitem'], function(field) {
                return model.getField(field) != null;
            });
        },
        run: function(resource, fieldName) {
            var promise = treeBusinessRules.buildFullName(resource).then(
                function(acc) {
                    return {
                        key: 'tree-structure',
                        valid: true,
                        action: function() {
                            return resource.set('fullname', acc.reverse().join(' '));
                        }
                    };
                },
                function(reason) {
                    return (fieldName == 'parent') && Q.when({
                        key: 'tree-structure',
                        valid: false,
                        reason: reason
                    });
                }
            );
            promise.then(function(result) { console.debug('Tree BR finished',
                                                          {node: resource, field: fieldName},
                                                          result); });
            return promise;
        },
        buildFullName: function(resource) {
            return Q.all([resource, [], true,
                          resource.getRelated('parent', {prePop: true, noBusinessRules: true}),
                          resource.getRelated('definitionitem', {prePop: true, noBusinessRules: true})
                         ]).spread(buildFullName);
        },
        init: function(resource) {
            resource.isNew() && resource.set('isaccepted', true);
        }
    };

    return treeBusinessRules;
});
