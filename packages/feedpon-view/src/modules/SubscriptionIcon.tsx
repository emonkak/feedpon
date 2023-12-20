import React from 'react';

interface SubscriptionIconProps {
  iconUrl: string;
  title: string;
}

export default function SubscriptionIcon({
  iconUrl,
  title,
}: SubscriptionIconProps) {
  if (iconUrl) {
    return (
      <img
        className="u-vertical-middle u-object-fit-cover"
        alt={title}
        src={iconUrl}
        width={16}
        height={16}
      />
    );
  } else {
    return <i className="icon icon-16 icon-file " />;
  }
}
