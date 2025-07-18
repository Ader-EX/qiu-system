"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CustomBreadcrumbProps {
  listData: string[];
  linkData: string[];
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  listData,
  linkData,
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {listData.map((item, idx) => {
          // Build path up to current index, default to root
          const isLast = linkData && linkData.length - 1 == idx;
          const hrefPath =
            linkData && linkData.length > idx
              ? `/${linkData.slice(0, idx + 1).join("/")}`
              : "/";

          return (
            <React.Fragment key={idx}>
              {idx > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink href={isLast ? "#" : hrefPath}>
                  {item}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CustomBreadcrumb;
