'use client';
import {PublishButton,UnpublishButton,useAuth,useDocumentInfo} from '@payloadcms/ui';
import {permitted,type Section} from '../access';
function useCanPublish(){const {user}=useAuth();const {collectionSlug}=useDocumentInfo();return !!collectionSlug&&permitted(user,collectionSlug as Section,'publish');}
export function PublishAction(){const allowed=useCanPublish();return allowed?<span className="pmc-publish-action"><PublishButton label="გამოქვეყნება"/></span>:null;}
export function UnpublishAction(){const allowed=useCanPublish();return allowed?<span className="pmc-unpublish-action"><UnpublishButton label="გამოქვეყნების გაუქმება"/></span>:null;}
