from rest_framework import serializers
from django.contrib.auth.models import User

from .models import BucketList, Item


class ItemSerializer(serializers.ModelSerializer):
	class Meta:
		model = Item
		fields = ('item_id', 'name', 'date_created', 'date_modified', 'done')
		read_only_fields = ('item_id', 'date_created', 'date_modified')


class BucketListSerializer(serializers.ModelSerializer):
	item = ItemSerializer(many=True, read_only=True)

	class Meta:
		model = BucketList
		fields = (
			'buck_id', 'name', 'item', 'date_created',
			'date_modified', 'created_by'
		)
		read_only_fields = (
			'buck_id', 'created_by', 'date_created', 'date_modified',
		)


class UserSerializer(serializers.ModelSerializer):

	class Meta:
		model = User
		fields = ('id', 'username', 'password')
		extra_kwargs = {'password': {'write_only': True}}
