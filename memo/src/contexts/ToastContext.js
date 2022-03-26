import React from "react";
import { toast, Toaster, ToastBar } from "react-hot-toast";
import CloseButton from "../components/Button/CloseButton";
import { Box } from "@material-ui/core";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={1}
      toastOptions={{
        duration: 4000,
        style: {
          color: "#233433",
          fontFamily: "montserrat, sans-serif",
          fontWeight: "500",
          fontSize: "14px",
          position: "relative",
          top:'70px'
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              <Box px="5px">{message}</Box>
              {t.type !== "loading" && (
                <CloseButton onClick={() => toast.dismiss(t.id)} />
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};
