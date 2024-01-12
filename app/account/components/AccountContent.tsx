"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { postData } from "@/libs/helpers";

const AccountContent = () => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { isLoading, subscription, user } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link'
      });
      window.location.assign(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
    setLoading(false);
  };

  return ( 
    <div className="mb-7 px-6">
      {!subscription && (
        <div className="flex flex-col gap-y-4">
        <p>You are currently on a <b>Free Plan</b>.<br/>
        <br />Upgrage to <b>Clonify Premium plan</b>for 
        <br /><li>Uploading Songs to the website</li><li>Adding your uploaded songs to <b>Your Library</b></li>
        <br/>
        <br /> Use the following credentials for testing the features:
        <br/><b>Card Number:</b> 4242 4242 4242 4242
        <br /><b>Any Future Month/Year</b> - Like: 12/26 
        <br /><b>Any 3 Digit CVV</b> - Like: 123
        <br /><b>Set Country to USA</b> - and abc/123 Address   
        </p>
        <Button 
          onClick={subscribeModal.onOpen}
          className="w-[300px] my-8"
        >
          Subscribe
        </Button>
      </div>
      )}
      {subscription && (
        <div className="flex flex-col gap-y-4">
          <p>You are currently on the 
            <b> {subscription?.prices?.products?.name} plan.</b> 
            
          </p>
          <Button
            disabled={loading || isLoading}
            onClick={redirectToCustomerPortal}
            className="w-[300px]"
          >
            Open customer portal
          </Button>
        </div>
      )}
    </div>
  );
}
 
export default AccountContent;
