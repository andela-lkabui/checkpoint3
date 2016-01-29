from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

from rest_framework import status, viewsets, permissions
from rest_framework.response import Response

from .serializers import BucketListSerializer, ItemSerializer, UserSerializer
from .models import BucketList, Item
from .permissions import IsOwnerOrReadOnly
from .paginator import BucketlistPaginator


class BucketListViewSet(viewsets.ModelViewSet):
	"""This class handles CRUD requests to the '/bucketlists/' url."""
	queryset = BucketList.objects.all()
	serializer_class = BucketListSerializer
	# permission_classes = (
	# 	permissions.IsAuthenticated,
	# 	# IsOwnerOrReadOnly
	# )
	pagination_class = BucketlistPaginator

	def get_queryset(self):
		if self.kwargs.get('pk'):
			return BucketList.objects.filter(pk=self.kwargs.get('pk'))

		search_name = self.request.query_params.get('q', None)
		if search_name:
			return BucketList.objects.filter(name=search_name)

		return BucketList.objects.all()

	def get_object(self):
		obj = get_object_or_404(self.get_queryset())
		self.check_object_permissions(self.request, obj)
		return obj

	def create(self, request):
		"""Customize the '/bucketlist/' POST request.

		Save the currently logged in user as the creator of the
		bucketlist.
		"""
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			current_user = request.user
			BucketList.create_bucketlist(current_user, **serializer.validated_data)
			return Response(
				{
					'status': 'Success',
					'message': 'BucketList created'
				},
				status=status.HTTP_201_CREATED
			)
		return Response(
			{
				'status': "Bad request",
				'message': "Failed to create an BucketList"
			},
			status=status.HTTP_401_BAD_REQUEST
		)


class ItemViewSet(viewsets.ModelViewSet):
	"""
	This class handles CRUD requests
	to the '/bucketlists/<buck_id>/items/' url.
	"""
	serializer_class = ItemSerializer
	queryset = Item.objects.all()
	# problem here: item objects have no attribute created_by
	permission_classes = (
		permissions.IsAuthenticated,
		IsOwnerOrReadOnly
	)
	pagination_class = BucketlistPaginator

	def list(self, request, bucketlist_pk=None):
		"""Customize the get request to the '/bucketlists/<buck_id>/items' url.

		Filter out items which don't belong to bucketlist of id <buck_id>.
		"""
		bucketlist = BucketList.objects.get(buck_id=bucketlist_pk)
		queryset = Item.objects.filter(bucketlist=bucketlist)
		serializer = ItemSerializer(queryset, many=True)
		return Response(serializer.data)

	def retrieve(self, request, pk=None, bucketlist_pk=None):
		"""Customize the get request to the
			'/bucketlists/<buck_id>/items/<item_id>' url.

		Only retrieves item of <item_id> under bucketlist of <buck_id>.
		"""
		bucketlist = BucketList.objects.get(buck_id=bucketlist_pk)
		queryset = Item.objects.filter(bucketlist=bucketlist, item_id=pk)
		item = get_object_or_404(queryset)
		serializer = ItemSerializer(item)
		return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
	serializer_class = UserSerializer
	queryset = User.objects.all()
